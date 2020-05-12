import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
describe('UserEntity', () => {
  let user: User;
  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = bcrypt.genSaltSync(10);
    bcrypt.hashSync = jest.fn();
  });
  describe('validatePassword', () => {
    it('returns true as password is valid', () => {
      bcrypt.hashSync.mockReturnValue('testPassword');
      expect(bcrypt.hashSync).not.toHaveBeenCalled();

      const result = user.validatePassword('123456');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('123456', user.salt);
      expect(result).toEqual(true);
    });

    it('returns false as password is invalid', () => {
      bcrypt.hashSync.mockReturnValue('testPasswor');
      expect(bcrypt.hashSync).not.toHaveBeenCalled();

      const result = user.validatePassword('123456');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('123456', user.salt);
      expect(result).toEqual(false);
    });
  });
});
