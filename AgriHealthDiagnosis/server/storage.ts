import { users, diagnoses, type User, type InsertUser, type Diagnosis, type InsertDiagnosis } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis>;
  getDiagnoses(userId: number): Promise<Diagnosis[]>;
  getDiagnosis(id: number): Promise<Diagnosis | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diagnoses: Map<number, Diagnosis>;
  private userId: number;
  private diagnosisId: number;

  constructor() {
    this.users = new Map();
    this.diagnoses = new Map();
    this.userId = 1;
    this.diagnosisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDiagnosis(insertDiagnosis: InsertDiagnosis): Promise<Diagnosis> {
    const id = this.diagnosisId++;
    const diagnosis: Diagnosis = {
      ...insertDiagnosis,
      id,
      createdAt: new Date(),
      diagnosis: null,
    };
    this.diagnoses.set(id, diagnosis);
    return diagnosis;
  }

  async getDiagnoses(userId: number): Promise<Diagnosis[]> {
    return Array.from(this.diagnoses.values()).filter(
      (diagnosis) => diagnosis.userId === userId,
    );
  }

  async getDiagnosis(id: number): Promise<Diagnosis | undefined> {
    return this.diagnoses.get(id);
  }
}

export const storage = new MemStorage();
