import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {}

    create(email: string, password: string) {
            const user = this.repo.create({ email, password }); // create a new user instance
            return this.repo.save(user); // save the user to the database
    }

    findOne(id: number) {
        if (!id) {
            return null;
        }
        return this.repo.findOneBy({ id });
    }

    find(email: string) {
        return this.repo.findBy({ email });
    }

    async update(id: number, attrs: Partial<User>) {
        const user = await this.repo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        Object.assign(user, attrs); // update the user with the new attributes
        return this.repo.save(user); // save the updated user to the database
    }

    async remove(id: number) {
        const user = await this.repo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.repo.remove(user); // remove the user from the database
    }

}