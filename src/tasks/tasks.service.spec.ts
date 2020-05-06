import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = { username: 'Test user', id: 12 } as User;

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.OPEN,
        search: 'search',
      };

      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and succesfully retrieves and returns the task', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('createTask should call taskRepository.createTask()', async () => {
      const dto: CreateTaskDto = { title: 'title', description: 'desc' };
      taskRepository.createTask.mockResolvedValue('Task');

      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const result = await tasksService.createTask(dto, mockUser);

      expect(taskRepository.createTask).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual('Task');
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.deleteTask() to delete task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });

      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('throws an error if task could not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('calls taskService.getTaskById() and task.save()', async () => {
      const mockTask = {
        status: TaskStatus.IN_PROGRESS,
        save: jest.fn(),
      };
      const spy = jest
        .spyOn(tasksService, 'getTaskById')
        .mockResolvedValue(mockTask);
      await tasksService.updateTaskStatus(11, TaskStatus.OPEN, mockUser);
      expect(spy).toHaveBeenCalledWith(11, mockUser);
      expect(mockTask.save).toHaveBeenCalled();
      expect(mockTask.status).toEqual(TaskStatus.OPEN);
    });
  });
});
