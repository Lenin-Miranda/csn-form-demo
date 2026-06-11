import { Test, TestingModule } from '@nestjs/testing';
import { EmailJobsController } from './email-jobs.controller';
import { EmailJobsProcessorService } from './email-jobs-processor.service';

describe('EmailJobsController', () => {
  let controller: EmailJobsController;
  let emailJobsProcessorService: {
    processPending: jest.Mock;
    processById: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailJobsController],
      providers: [
        {
          provide: EmailJobsProcessorService,
          useValue: {
            processPending: jest.fn(),
            processById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailJobsController>(EmailJobsController);
    emailJobsProcessorService = module.get(EmailJobsProcessorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('processes pending email jobs with the provided limit', async () => {
    emailJobsProcessorService.processPending.mockResolvedValue(3);

    await expect(controller.processPending({ limit: 5 })).resolves.toEqual({
      ok: true,
      processed: 3,
    });
    expect(emailJobsProcessorService.processPending).toHaveBeenCalledWith(5);
  });

  it('defaults processed count to zero when the processor returns nothing', async () => {
    emailJobsProcessorService.processPending.mockResolvedValue(undefined);

    await expect(controller.processPending({})).resolves.toEqual({
      ok: true,
      processed: 0,
    });
    expect(emailJobsProcessorService.processPending).toHaveBeenCalledWith(
      undefined,
    );
  });

  it('processes a single email job by id', async () => {
    emailJobsProcessorService.processById.mockResolvedValue(undefined);

    await expect(
      controller.processById('6a2908f8-cbd5-47bb-9160-bdb59cf0d50d'),
    ).resolves.toEqual({
      ok: true,
    });
    expect(emailJobsProcessorService.processById).toHaveBeenCalledWith(
      '6a2908f8-cbd5-47bb-9160-bdb59cf0d50d',
    );
  });
});
