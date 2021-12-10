import {Injectable} from "@angular/core";
import {BooksService} from "../services/books.service";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {loadBooksAction, saveBookAction, setBooksAction} from "./books.actions";
import {map, mergeMap} from "rxjs/operators";

@Injectable()
export class BooksEffects {

  constructor(private readonly actions$: Actions, private readonly booksService: BooksService) {
  }

  readonly loadBooks$ = createEffect(() => this.actions$.pipe(
    ofType(loadBooksAction),
    mergeMap(_ => this.booksService.getBooks().pipe(
      map(books => setBooksAction({books}))))
  ));

  readonly saveBooks$ = createEffect(() => this.actions$.pipe(
    ofType(saveBookAction),
    mergeMap(action => this.booksService.saveBook(action.book).pipe(
      map(_ => loadBooksAction())
    ))
  ));
}
