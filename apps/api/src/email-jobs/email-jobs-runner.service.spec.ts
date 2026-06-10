import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailJobsProcessorService } from './email-jobs-processor.service';
import { EmailJobsRunnerService } from './email-jobs-runner.service';

describe('EmailJobsRunnerService', () => {
  let service: EmailJobsRunnerService;
  let configService: { get: jest.Mock };
  let processorService: { processPending: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailJobsRunnerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailJobsProcessorService,
          useValue: {
            processPending: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailJobsRunnerService>(EmailJobsRunnerService);
    configService = module.get(ConfigService);
    processorService = module.get(EmailJobsProcessorService);
  });

  it('processes pending email jobs with the default batch size', async () => {
    configService.get.mockReturnValue(undefined);

    await service.runPendingEmailJobs();

    expect(processorService.processPending).toHaveBeenCalledWith(10);
  });

  it('uses the configured batch size when valid', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'EMAIL_JOBS_BATCH_SIZE') {
        return '25';
      }

      return undefined;
    });

    await service.runPendingEmailJobs();

    expect(processorService.processPending).toHaveBeenCalledWith(25);
  });

  it('skips processing when disabled by configuration', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'EMAIL_JOBS_PROCESSOR_ENABLED') {
        return 'false';
      }

      return undefined;
    });

    await service.runPendingEmailJobs();

    expect(processorService.processPending).not.toHaveBeenCalled();
  });

  it('does not start a second run while one is already in progress', async () => {
    let release!: () => void;
    processorService.processPending.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );

    const firstRun = service.runPendingEmailJobs();
    const secondRun = service.runPendingEmailJobs();

    await Promise.resolve();

    expect(processorService.processPending).toHaveBeenCalledTimes(1);

    release();

    await Promise.all([firstRun, secondRun]);
  });

  it('swallows processor failures and resets the running state', async () => {
    processorService.processPending.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(service.runPendingEmailJobs()).resolves.toBeUndefined();
    await expect(service.runPendingEmailJobs()).resolves.toBeUndefined();

    expect(processorService.processPending).toHaveBeenCalledTimes(2);
  });
});
