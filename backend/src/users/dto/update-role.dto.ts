import { IsEnum, IsNotEmpty } from 'class-validator';

enum Role {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
}

export class UpdateRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: string;
}
