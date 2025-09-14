import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db"; // your sequelize instance

interface JobAttributes {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  url: string;
  description?: string | null;
  posted_at?: Date | null;
  scraped_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JobCreationAttributes extends Optional<JobAttributes, "id" | "scraped_at" | "createdAt" | "updatedAt"> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public title!: string;
  public company!: string;
  public location!: string | null;
  public url!: string;
  public description!: string | null;
  public posted_at!: Date | null;
  public scraped_at!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: true },
    url: { type: DataTypes.STRING, allowNull:
