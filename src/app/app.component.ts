import { filter } from "rxjs";
import { ulid } from "ulid";
import { Component, OnInit } from "@angular/core";
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
export class AppComponent implements OnInit {
  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  sortFlag: boolean = false;

  todoContainerForm = this.formBuilder.group({
    todos: this.formBuilder.array<FormGroup<TodoForm>>([])
  });

  get todos() {
    return this.todoContainerForm.controls.todos;
  }

  sortTodos() {
    if (this.todos.value.length > 1) {
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
      .pipe(filter(() => this.todoContainerForm.valid))
      .subscribe((val) => localStorage.setItem("TODO_DATA", JSON.stringify(val.todos)));
  }
}
