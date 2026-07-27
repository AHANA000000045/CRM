import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'completed';
  dueDate: string;
  createdAt: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRippleModule,
    MatTooltipModule,
    MatCheckboxModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  private fb = inject(FormBuilder);

  tasks = signal<TaskItem[]>([]);
  filter = signal<'all' | 'active' | 'completed'>('all');
  showAddForm = signal(false);
  taskForm!: FormGroup;
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTasks();
    this.initForm();
  }

  loadTasks(): void {
    const cached = localStorage.getItem('flowcrm_tasks');
    if (cached) {
      this.tasks.set(JSON.parse(cached));
    } else {
      const defaultTasks: TaskItem[] = [
        {
          id: 'task_1',
          title: 'Prepare demo deck for Acme Corporation',
          description: 'Create slide deck focusing on multi-tenant security and RBAC capability.',
          priority: 'high',
          status: 'todo',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task_2',
          title: 'Follow up on lead John Doe',
          description: 'Call John Doe to discuss pricing options and schedule a scoping call.',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // 4 days from now
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task_3',
          title: 'Update monthly sales targets',
          description: 'Sync target targets with performance metrics of last quarter.',
          priority: 'low',
          status: 'completed',
          dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // yesterday
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ];
      localStorage.setItem('flowcrm_tasks', JSON.stringify(defaultTasks));
      this.tasks.set(defaultTasks);
    }
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      priority: ['medium', [Validators.required]],
      dueDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update((val) => !val);
    if (!this.showAddForm()) {
      this.initForm();
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const newTask: TaskItem = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      ...this.taskForm.value,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...this.tasks()];
    this.saveTasks(updated);
    this.toggleAddForm();
    this.showToast('Task created successfully.');
  }

  toggleTaskStatus(task: TaskItem): void {
    const updated = this.tasks().map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: t.status === 'todo' ? 'completed' : 'todo' as 'todo' | 'completed',
        };
      }
      return t;
    });
    this.saveTasks(updated);
    const completed = task.status === 'todo'; // since it toggles to completed
    this.showToast(completed ? 'Task marked as completed.' : 'Task marked as active.');
  }

  deleteTask(taskId: string): void {
    const updated = this.tasks().filter((t) => t.id !== taskId);
    this.saveTasks(updated);
    this.showToast('Task deleted.');
  }

  setFilter(f: 'all' | 'active' | 'completed'): void {
    this.filter.set(f);
  }

  getFilteredTasks(): TaskItem[] {
    const f = this.filter();
    const allTasks = this.tasks();

    if (f === 'active') {
      return allTasks.filter((t) => t.status === 'todo');
    }
    if (f === 'completed') {
      return allTasks.filter((t) => t.status === 'completed');
    }
    return allTasks;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  private saveTasks(items: TaskItem[]): void {
    localStorage.setItem('flowcrm_tasks', JSON.stringify(items));
    this.tasks.set(items);
  }

  private showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
