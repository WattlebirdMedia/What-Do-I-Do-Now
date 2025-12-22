import { tasks, type Task, type InsertTask } from "@shared/schema";
import { db, pool } from "./db";
import { eq, asc, and } from "drizzle-orm";

export interface IStorage {
  getTasks(userId: string): Promise<Task[]>;
  getCompletedTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask, userId: string): Promise<Task>;
  completeTask(id: string, userId: string): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<void>;
  reorderTasks(taskIds: string[], userId: string): Promise<void>;
  clearCompletedTasks(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTasks(userId: string): Promise<Task[]> {
    return db.select().from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, false)))
      .orderBy(asc(tasks.position));
  }

  async getCompletedTasks(userId: string): Promise<Task[]> {
    return db.select().from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)))
      .orderBy(asc(tasks.completedAt));
  }

  async createTask(insertTask: InsertTask, userId: string): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({ ...insertTask, userId })
      .returning();
    return task;
  }

  async completeTask(id: string, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ completed: true, completedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async reorderTasks(taskIds: string[], userId: string): Promise<void> {
    for (let i = 0; i < taskIds.length; i++) {
      await db.update(tasks)
        .set({ position: i })
        .where(and(eq(tasks.id, taskIds[i]), eq(tasks.userId, userId)));
    }
  }

  async clearCompletedTasks(userId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.userId, userId), eq(tasks.completed, true)));
  }
}

export const storage = new DatabaseStorage();
