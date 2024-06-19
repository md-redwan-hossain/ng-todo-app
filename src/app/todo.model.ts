import { FormControl } from "@angular/forms";

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TodoForm {
  id: FormControl<string>;
  title: FormControl<string>;
  isCompleted: FormControl<boolean>;
}
