import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../infrastructure/schemas/user.schema';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email });
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toEntity(user) : null;
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const created = await this.userModel.create(userData);
    return this.toEntity(created);
  }

  private toEntity(document: User): UserEntity {
    return new UserEntity(
      document._id as string,
      document.email,
      document.firstName,
      document.lastName,
      document.picture,
      document.provider,
      document.providerId,
    );
  }
}
