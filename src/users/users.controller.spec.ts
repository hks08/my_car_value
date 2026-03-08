import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ 
          id, 
          email: 'test@example.com', 
          password: 'password' 
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'password' }] as User[]);
      },
      // remove: (id: number) => {},
      // update: () => {}
    };

    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    // const mockUsersService = {
    //   findAll: jest.fn(),
    //   findOne: jest.fn(),
    //   create: jest.fn(),
    //   // ...add other mocked methods if your controller uses them
    // };

    // const mockAuthService = {
    //   validateUser: jest.fn(),
    //   login: jest.fn(),
    //   // ...add other mocked methods if your controller uses them
    // };

    // const module: TestingModule = await Test.createTestingModule({
    //   controllers: [UsersController],
    //   providers: [
    //     { provide: UsersService, useValue: fakeUsersService },
    //     { provide: AuthService, useValue: fakeAuthService },
    //   ],
    // }).compile();

    // controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUser returns a list of users with the given email', async() => {
    const users = await controller.findAllUsers('test@example.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
  });

  it('findUser returns a single user with the given id', async() => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'test@example.com', password: 'password' },
      session
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
    // expect(user).toBeDefined();
  });

});