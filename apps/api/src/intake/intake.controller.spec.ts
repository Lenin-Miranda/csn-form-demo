import { Test, TestingModule } from '@nestjs/testing';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';

describe('IntakeController', () => {
  let controller: IntakeController;
  let intakeService: {
    findQuestions: jest.Mock;
    findPreviousQuestion: jest.Mock;
    findNextQuestion: jest.Mock;
    createQuestion: jest.Mock;
  };

  beforeEach(async () => {
    intakeService = {
      findQuestions: jest.fn(),
      findPreviousQuestion: jest.fn(),
      findNextQuestion: jest.fn(),
      createQuestion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntakeController],
      providers: [
        {
          provide: IntakeService,
          useValue: intakeService,
        },
      ],
    }).compile();

    controller = module.get<IntakeController>(IntakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates previous question lookup to the service', () => {
    controller.findPreviousQuestion(
      'student-intake',
      '7d31f1bc-2f47-4e3c-b57a-d7b3f1d96011',
    );

    expect(intakeService.findPreviousQuestion).toHaveBeenCalledWith(
      '7d31f1bc-2f47-4e3c-b57a-d7b3f1d96011',
      'student-intake',
    );
  });

  it('delegates next question lookup to the service', () => {
    controller.findNextQuestion(
      'student-intake',
      '7d31f1bc-2f47-4e3c-b57a-d7b3f1d96011',
    );

    expect(intakeService.findNextQuestion).toHaveBeenCalledWith(
      '7d31f1bc-2f47-4e3c-b57a-d7b3f1d96011',
      'student-intake',
    );
  });
});
