import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { filter } from "rxjs";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { CheckboxModule } from "primeng/checkbox";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

interface TodoForm {
  title: FormControl<string>;
  isCompleted: FormControl<boolean>;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    CheckboxModule,
    TooltipModule
  ],
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
