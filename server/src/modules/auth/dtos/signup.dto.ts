import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator"

export class SignupUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: "Name must be at least 3 characters long",
  })
  @MaxLength(20, {
    message: "Name must be at most 20 characters long",
  })
  name!: string

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(128)
  email!: string

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string
}
