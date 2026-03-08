import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';


describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of the users service
        const users: User[] = [];
        fakeUsersService = {
            // find: () => Promise.resolve([]),
            // create: (email: string, password: string) => 
            //     Promise.resolve({ id: 1, email, password } as User)
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 999999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            }
        };
        
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                { 
                    provide: UsersService, 
                    useValue: fakeUsersService 
                },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });
    

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('test@gmail.com', 'test');

        expect(user.password).not.toEqual('test');

        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
        fakeUsersService.find = () =>
            Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
        await expect(service.signup('test@gmail.com', 'test')).rejects.toThrow(
            BadRequestException,
        );
    });

    it('throws if signin is called with an unused email', async () => {
        await expect(
            service.signin('test@gmail.com', 'test'),
        ).rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        fakeUsersService.find = () =>
            Promise.resolve([
                { id: 1, email: 'test@gmail.com', password: 'hashedpassword' } as User
            ]);
        await expect(
            service.signin('test@gmail.com', 'wrongpassword')
        ).rejects.toThrow(BadRequestException);
    });

    it('returns a user if correct password is provided', async () => {
        // fakeUsersService.find = () =>
        //     Promise.resolve([
        //         { email: 'test@gmail.com', password: 'ec453ce9bb9e54dc.5e7c938694bb59e65635456b967acd2e3d3d6712b991bf8142762c0857cdb4f9' } as User
        //     ]);
        await service.signup('test@gmail.com', 'test');

        const user = await service.signin('test@gmail.com', 'test');
        expect(user).toBeDefined();
        // const user = await service.signup('test@gmail.com', 'test');
        // console.log(user);
    });


});