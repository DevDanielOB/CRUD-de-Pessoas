import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsDateString, IsPhoneNumber, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidCpf } from 'src/common/validators';

export class CreatePersonDto {
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'joao.silva@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '12345678901' })
  @IsNotEmpty()
  @IsString()
  @IsValidCpf()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  cpf!: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsNotEmpty()
  @IsDateString()
  @ValidateIf((o) => {
    const date = new Date(o.birthDate);
    return date <= new Date();
  }, {
    message: 'Data de nascimento não pode ser futura',
  })
  birthDate!: string;

  @ApiProperty({ example: '11987654321' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  phone!: string;
}