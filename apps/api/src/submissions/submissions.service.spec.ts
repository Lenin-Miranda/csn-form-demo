import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StudentsService } from '../students/students.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
        {
          provide: StudentsService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
