import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { filter } from "rxjs";
import { ulid } from "ulid";
import { Todo, TodoForm } from "./todo.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule, NgbTooltipModule],
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly canSort = signal(false);
  private sortFlag = false;

  todoContainerForm = this.formBuilder.group({
    todos: this.formBuilder.array<FormGroup<TodoForm>>([])
  });

  get todos() {
    return this.todoContainerForm.controls.todos;
  }

  sortTodos() {
    if (this.canSort()) {
      const arr = this.todos.value.sort((a, b) => {
        if (this.sortFlag) {
          return a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
        } else {
          return a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1;
        }
      });
      this.sortFlag = !this.sortFlag;
      this.todos.patchValue(arr);
    }
  }

  addTodo(data?: Todo) {
    const itemForm = this.formBuilder.group({
      id: [data?.id || ulid(), Validators.required],
      title: [data?.title || "", Validators.required],
      isCompleted: [data?.isCompleted || false, Validators.required]
    });
    this.todos.push(itemForm);
  }

  deleteTodo(todoIndex: number) {
    this.todos.removeAt(todoIndex);
  }

  idResolver(elem: string, id: string) {
    return elem.concat(id);
  }

  ngOnInit() {
    const formData = localStorage.getItem("TODO_DATA");
    if (formData) {
      JSON.parse(formData).forEach((item: Todo) => this.addTodo(item));
    }

    this.todoContainerForm.valueChanges
      .pipe(
        filter(() => this.todoContainerForm.valid),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((val) => {
        localStorage.setItem("TODO_DATA", JSON.stringify(val.todos));

        if (this.todos.value.length > 1) {
          let hasTrue = false;
          let hasFalse = false;

          for (const obj of this.todos.value) {
            if (obj.isCompleted) {
              hasTrue = true;
            } else if (!obj.isCompleted) {
              hasFalse = true;
            }
          }

          if (hasTrue && hasFalse) {
            this.canSort.set(true);
          } else {
            this.canSort.set(false);
          }
        }
      });
  }
}
