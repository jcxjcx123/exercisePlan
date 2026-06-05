import { defineStore } from 'pinia';
import { db } from '@/utils/db.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    intake: {
      tdee: 0,
      goal: 'muscle', // 'muscle' or 'fat'
      muscle_calories: 0,
      muscle_carb: 0,
      muscle_protein: 0,
      muscle_fat: 0,
      fat_calories: 0,
      fat_carb: 0,
      fat_protein: 0,
      fat_fat: 0
    },
    bodyRecords: []
  }),
  actions: {
    async fetchIntake() {
      try {
        const res = await db.select('SELECT * FROM user_intake LIMIT 1');
        if (res && res.length > 0) {
          this.intake = { ...this.intake, ...res[0] };
        }
      } catch (e) {
        console.error('Fetch intake failed', e);
      }
    },
    async saveIntake(data) {
      try {
        const res = await db.select('SELECT id FROM user_intake LIMIT 1');
        if (res && res.length > 0) {
          await db.execute(
            'UPDATE user_intake SET tdee=?, goal=?, muscle_calories=?, muscle_carb=?, muscle_protein=?, muscle_fat=?, fat_calories=?, fat_carb=?, fat_protein=?, fat_fat=? WHERE id=?',
            [data.tdee, data.goal, data.muscle_calories, data.muscle_carb, data.muscle_protein, data.muscle_fat, data.fat_calories, data.fat_carb, data.fat_protein, data.fat_fat, res[0].id]
          );
        } else {
          await db.execute(
            'INSERT INTO user_intake (tdee, goal, muscle_calories, muscle_carb, muscle_protein, muscle_fat, fat_calories, fat_carb, fat_protein, fat_fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.tdee, data.goal, data.muscle_calories, data.muscle_carb, data.muscle_protein, data.muscle_fat, data.fat_calories, data.fat_carb, data.fat_protein, data.fat_fat]
          );
        }
        await this.fetchIntake();
      } catch (e) {
        console.error('Save intake failed', e);
      }
    },
    async fetchBodyRecords() {
      try {
        const res = await db.select('SELECT * FROM body_records ORDER BY record_date DESC');
        this.bodyRecords = res;
      } catch (e) {
        console.error('Fetch body records failed', e);
      }
    },
    async addBodyRecord(record) {
      try {
        await db.execute(
          'INSERT INTO body_records (weight, chest, waist, thigh, arm, record_date) VALUES (?, ?, ?, ?, ?, ?)',
          [record.weight, record.chest, record.waist, record.thigh, record.arm, record.record_date]
        );
        await this.fetchBodyRecords();
      } catch (e) {
        console.error('Add body record failed', e);
      }
    }
  }
});
