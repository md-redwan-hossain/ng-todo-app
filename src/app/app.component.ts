import { filter } from "rxjs";
import { Component, OnInit } from "@angular/core";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";

interface TodoForm {
  title: FormControl<string>;
  isCompleted: FormControl<boolean>;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule, NgbTooltipModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit {
  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  todoContainerForm = this.formBuilder.group({
    todos: this.formBuilder.array<FormGroup<TodoForm>>([])
  });

  get todos() {
    return this.todoContainerForm.controls.todos;
  }

  idResolver(elem: string, index: number) {
    return elem.concat(index.toString());
  }

  completeCheckboxToolTipResolver(item: FormControl<boolean>) {
    return item.value ? "Mark as not completed" : "Mark as completed";
  }

  addTodo(data?: TodoForm) {
    const itemForm = this.formBuilder.group({
      title: [data?.title || "", Validators.required],
      isCompleted: [data?.isCompleted || false, Validators.required]
    });
    this.todos.push(itemForm);
  }

  deleteTodo(todoIndex: number) {
    this.todos.removeAt(todoIndex);
  }

  ngOnInit() {
    const formData = localStorage.getItem("TODO_DATA");
    if (formData) {
      JSON.parse(formData).forEach((item: TodoForm) => this.addTodo(item));
    }

    this.todoContainerForm.valueChanges
      .pipe(filter(() => this.todoContainerForm.valid))
      .subscribe((val) => localStorage.setItem("TODO_DATA", JSON.stringify(val.todos)));
  }
}
