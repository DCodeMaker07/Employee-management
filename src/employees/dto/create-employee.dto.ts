import { IsNumber, IsString } from "class-validator";

export class CreateEmployeeDto {

    @IsString()
    tipoDocumento: string;

    @IsNumber()
    numeroDocumento: number;

    @IsString()
    nombre: string;

    @IsString()
    apellido: string;

    @IsString()
    cargo: string;

    @IsString()
    fechaNacimiento: string;

}