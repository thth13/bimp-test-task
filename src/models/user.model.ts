import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './message.model';
import { File } from './file.model';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => File, (file) => file.user)
  files: File[];
}