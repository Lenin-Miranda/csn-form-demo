import { Test, TestingModule } from '@nestjs/testing';
import { IntakeService } from './intake.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('IntakeService', () => {
  let service: IntakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntakeService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IntakeService>(IntakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
