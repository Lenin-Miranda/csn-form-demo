import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateStudentDto } from './dto/students.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { StudentRow, StudentsService } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let supabaseService: { getClient: jest.Mock };

  const dto: CreateStudentDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '5551234567',
  };

  const student: StudentRow = {
    id: 'student-1',
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    created_at: '2026-06-05T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    supabaseService = module.get(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns an existing student when the email is already in use', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: student, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.findOrCreate(dto)).resolves.toEqual(student);
  });

  it('creates a student when the email does not exist yet', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    supabaseService.getClient.mockReturnValue({ from });
    jest.spyOn(service, 'create').mockResolvedValue(student);

    await expect(service.findOrCreate(dto)).resolves.toEqual(student);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('reloads the student when create hits a duplicate constraint race', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: student, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    supabaseService.getClient.mockReturnValue({ from });
    jest
      .spyOn(service, 'create')
      .mockRejectedValue(new ConflictException('Student already exists'));

    await expect(service.findOrCreate(dto)).resolves.toEqual(student);
  });

  it('throws when the email lookup fails', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'db down' } });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.findOrCreate(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('creates and returns a student row', async () => {
    const single = jest.fn().mockResolvedValue({ data: student, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.create(dto)).resolves.toEqual(student);
  });

  it('throws a conflict when Supabase reports a duplicate student', async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value' },
    });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
