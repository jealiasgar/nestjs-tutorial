import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/user/dto';
import { CreateBookmarkDto, UpdateBookmarkDto } from 'src/bookmark/dto';

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
    describe('Update user', () => {
      it('should update current user', () => {
        const dto: UpdateUserDto = {
          firstName: 'ali',
        };
        return pactum
          .spec()
          .patch('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmark', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Test bookmark',
        link: 'googlee.com',
      };
      it('should create bookmart', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmark', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Update Bookmark', () => {
      const dto: UpdateBookmarkDto = {
        title: 'new title',
        description: 'new desc',
        link: 'utube.com',
      };
      it('should update bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Delete Bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
  });
  it.todo('should pass');
});
