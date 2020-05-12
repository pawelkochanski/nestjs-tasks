import { UserRepository } from './user.repository';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockCredentialsDtio = {
  username: 'TestUsername',
  password: 'TestPassword',
};

describe('UserREpository', () => {
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('succesfully sings up user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDtio)).resolves.not.toThrow();
    });

    it('throws conflict exception if user exists', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialsDtio)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws internal exception on other error', () => {
      save.mockRejectedValue({ code: '13' });
      expect(userRepository.signUp(mockCredentialsDtio)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    it('succesfully validates user if credials ar ok', async () => {
      const mockUser = {
        username: 'TestUsername',
        validatePassword: jest.fn().mockReturnValue(true),
      };
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      expect(userRepository.findOne).not.toHaveBeenCalled();
      const result = await userRepository.validateUserPassword(
        mockCredentialsDtio,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: mockUser.username,
      });
      expect(result).toEqual(mockUser.username);
    });

    it('returns null if user not found', () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(
        userRepository.validateUserPassword(mockCredentialsDtio),
      ).resolves.toEqual(null);
    });

    it('return null if user.validatePassword not true', async () => {
      const mockUser = {
        username: 'TestUsername',
        validatePassword: jest.fn().mockReturnValue(false),
      };
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDtio,
      );

      expect(result).toBeNull();
    });
  });
});
