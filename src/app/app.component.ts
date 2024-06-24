import { filter, Subscription } from "rxjs";
import { ulid } from "ulid";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Todo, TodoForm } from "./todo.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule, NgbTooltipModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  sortFlag = signal(false);
  canSort = signal(false);
  formChange: Subscription | undefined;

  todoContainerForm = this.formBuilder.group({
    todos: this.formBuilder.array<FormGroup<TodoForm>>([])
  });

  get todos() {
    return this.todoContainerForm.controls.todos;
  }

  sortTodos() {
    if (this.canSort()) {
      const arr = this.todos.value.sort((a, b) => {
        if (this.sortFlag()) {
          return a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
        } else {
          return a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1;
        }
      });
      this.sortFlag.update((val) => !val);
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

    this.formChange = this.todoContainerForm.valueChanges
      .pipe(filter(() => this.todoContainerForm.valid))
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

  ngOnDestroy(): void {
    if (this.formChange) {
      this.formChange.unsubscribe();
    }
  }
}
