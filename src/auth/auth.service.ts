import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signup() {
    return { msg: 'Hello' };
  }

  signin() {
    return 'I am a signin';
  }
}
