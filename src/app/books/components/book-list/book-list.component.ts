import {Component, OnDestroy} from '@angular/core';
import {Book} from "../../model/book";
import {BooksService} from "../../services/books.service";
import {Observable, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {select, Store} from "@ngrx/store";
import {BooksState} from "../../store/books.reducer";
import {deselectBookAction, selectBookAction, setBooksAction} from "../../store/books.actions";
import {BooksSelector} from "../../store/books.selectors";

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  providers: []
})
export class BookListComponent implements OnDestroy {

  readonly books$: Observable<Book[]>;
  readonly selectedBook$: Observable<Book | null>;
  selectedBookId: number | undefined = undefined;

  private readonly unsubscribe = new Subject();

  constructor(private readonly bookService: BooksService, private readonly store: Store<BooksState>) {
    this.bookService.getBooks()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(books => this.store.dispatch(setBooksAction({books})));
    this.books$ = this.store.pipe(select(BooksSelector.getBooks));
    this.selectedBook$ = this.store.pipe(select(BooksSelector.getSelectedBook));
    this.selectedBook$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(book => {
        if(book) {
          this.selectedBookId = book.id;
        } else {
          this.selectedBookId = undefined;
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  selectBook(book: Book): void {
    if(this.selectedBookId === book.id) {
      this.store.dispatch(deselectBookAction());
    } else {
      this.store.dispatch(selectBookAction({book}));
    }
  }

  cancelEditing(): void {
    this.store.dispatch(deselectBookAction());
  }

  saveBook(book: Book) {
    this.bookService.saveBook(book).pipe(takeUntil(this.unsubscribe)).subscribe(_ => {
      this.bookService.getBooks()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(books => this.store.dispatch(setBooksAction({ books })));
      this.store.dispatch(deselectBookAction());
    });
  }
}
