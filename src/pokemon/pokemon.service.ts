import { PokemonModule } from './pokemon.module';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly PokemonModel: Model<Pokemon>
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.PokemonModel.create(createPokemonDto);
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error);

    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    //si es numero
    if (!isNaN(+term)) {
      pokemon = await this.PokemonModel.findOne({ no: term })
    }
    //mongo id
    if (!pokemon && isValidObjectId(term))
      pokemon = await this.PokemonModel.findById(term);

    //name
    if (!pokemon) {
      pokemon = await this.PokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }

    if (!pokemon)
      throw new NotFoundException(`POkemon with id, name or no "${term} not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    try {
      const pokemon = await this.findOne(term)
      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

      await pokemon.updateOne(updatePokemonDto);

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return `Pokemon ${id} has been delete`;
    // const result = await this.PokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.PokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with" ${id} "not found`)
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon whit id ${JSON.stringify(error.keyValue)} exist in db`);
    }
    console.log(error);
    throw new InternalServerErrorException(`cant create pokemon- chec server logs`);
  }
}

