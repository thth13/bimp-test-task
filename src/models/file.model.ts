import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.model';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.files)
  user: User;
}