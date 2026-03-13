import { IsEnum, IsNotEmpty } from 'class-validator';

enum Role {
  ADMIN = 'admin',
  PARTICIPANT = 'participant',
}

export class UpdateRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: string;
}
