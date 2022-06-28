import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3335);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3335');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'ali@a.com',
      password: '123',
    };
    describe('Sign Up', () => {
      it('Should throw exception if email is empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ password: dto.password }).expectStatus(400);
      });
      it('Should throw exception if password is empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ email: dto.email }).expectStatus(400);
      });
      it('Should throw exception if body is empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should sign up', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      });
    });
    describe('Sign In', () => {
      it('Should throw exception if email is empty', () => {
        return pactum.spec().get('/auth/signin').withBody({ password: dto.password }).expectStatus(400);
      });
      it('Should throw exception if password is empty', () => {
        return pactum.spec().get('/auth/signin').withBody({ email: dto.email }).expectStatus(400);
      });
      it('Should throw exception if body is empty', () => {
        return pactum.spec().get('/auth/signin').expectStatus(400);
      });
      it('should sign in', () => {
        return pactum.spec().get('/auth/signin').withBody(dto).expectStatus(200).stores('userAt', 'auth_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it.todo('should sign up');
    });
  });

  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it.todo('should sign up');
    });
    describe('Get bookmark', () => {
      it.todo('should sign up');
    });
    describe('Get bookmark by id', () => {
      it.todo('should sign up');
    });
    describe('Edit Bookmark', () => {
      it.todo('should sign up');
    });
    describe('Delete Bookmark', () => {
      it.todo('should sign up');
    });
  });
  it.todo('should pass');
});
