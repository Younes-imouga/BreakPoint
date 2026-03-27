import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Role {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
}

export class UpdateRoleDto {
  @ApiProperty({ enum: Role, example: Role.PARTICIPANT })
  @IsEnum(Role)
  @IsNotEmpty()
  role: string;
}
