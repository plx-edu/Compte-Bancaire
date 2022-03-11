import { Injectable } from '@nestjs/common';
import {
  CreateTransactionDto,
  CreateDetailDto,
} from './dto/create-transaction.dto';
import {
  UpdateTransactionDto,
  UpdateDetailDto,
} from './dto/update-transaction.dto';
import { PrismaService } from '../prisma.service';
import { Transaction, Transaction_details, Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  /*
  async create(createTransactionDto: CreateTransactionDto) {
    // console.log(':::::\n', createTransactionDto, '\n:::::');

    var objJson1 = JSON.parse(JSON.stringify(createTransactionDto));
    const fromaccountid = objJson1.from_account_id;
    const toaccountid = objJson1.to_account_id;

    const amount = objJson1.amount;
    const type = objJson1.type;

    const login_id = objJson1.initiated_by;
    const var6 = objJson1.status_code;

    // console.log(':::::\n',objJson1, var1, '\n:::::');
    return await this.prisma
      .$executeRaw`CALL transfer(${login_id},${fromaccountid},${toaccountid},${amount},${type})`;
  }
*/

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // console.log(':::::\n', createTransactionDto, '\n:::::');

    const transaction = await this.prisma.transaction.create({
      data: createTransactionDto,
    });
    // console.log(':::::\n', transaction, '\n:::::');

    // Add detail(s) about transaction
    const n = transaction.to_account_id ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const createDetailDto: CreateDetailDto = {
        transaction_id: transaction.transaction_id,
        account_id:
          i === 0 ? transaction.from_account_id : transaction.to_account_id,
        amount: transaction.amount, // temporary change, not setting neegative amount
        type: transaction.type,
        status_code: transaction.status_code,
      };

      const detail = await this.prisma.transaction_details.create({
        data: createDetailDto,
      });
      // console.log(':::::\n', detail, '\n:::::');

      // Updating account balance
      const account = await this.prisma.account
        .findUnique({
          where: { account_id: detail.account_id },
        })
        .then((acc) => {
          // console.log('########', acc);
          return this.prisma.account.update({
            where: { account_id: acc.account_id },
            data: {
              account_balance: acc.account_balance + detail.amount,
            },
          });
        });
      // console.log(':::::\n', account, '\n:::::');
    }

    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      orderBy: {
        transaction_id: 'desc',
      },
      take: 10,
    });
  }

  async findOne(id: number): Promise<Transaction> {
    return this.prisma.transaction.findUnique({
      where: { transaction_id: id },
    });
  }
  async findOneDetails(id: number): Promise<Transaction_details[]> {
    return this.prisma.transaction_details.findMany({
      where: { transaction_id: id },
    });
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { transaction_id: id },
      data: updateTransactionDto,
    });
  }

  async remove(id: number) {
    return this.prisma.transaction.delete({
      where: { transaction_id: id },
    });
  }
}
