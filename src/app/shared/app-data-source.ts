import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Generic reusable DataSource with filter, sort and pagination.
 *
 * Usage:
 *   ds = new AppDataSource(data$, paginator, sort, ['name', 'qrCode']);
 *   ds.filter = 'mavi';
 */
export class AppDataSource<T extends object> extends DataSource<T> {
  private _filterChange        = new BehaviorSubject('');
  private _filteredDataChange  = new BehaviorSubject<T[]>([]);

  /** Filtered (pre-paginated) data — useful for showing total count */
  get filteredData(): T[] { return this._filteredDataChange.value; }
  private set filteredData(v: T[]) { this._filteredDataChange.next(v); }

  get filter(): string { return this._filterChange.value; }
  set filter(value: string) {
    this._filterChange.next(value);
    this._paginator.firstPage();
  }

  /**
   * @param data$        BehaviorSubject holding the full data array
   * @param _paginator   MatPaginator from the template (@ViewChild)
   * @param _sort        MatSort from the template (@ViewChild)
   * @param filterFields Keys of T to search within (e.g. ['name', 'qrCode'])
   */
  constructor(
    private data$: BehaviorSubject<T[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort,
    private filterFields: (keyof T)[] = [],
  ) {
    super();
  }

  connect(): Observable<T[]> {
    const changes = [
      this.data$,
      this._paginator.page,
      this._filterChange,
      this._sort.sortChange,
    ];

    return merge(...changes).pipe(
      map(() => {
        let data = this.data$.value.slice();

        // ── Filter ──
        if (this.filter.trim() && this.filterFields.length) {
          const needle = this.filter.toLowerCase();
          data = data.filter(row =>
            this.filterFields.some(field =>
              String(row[field] ?? '').toLowerCase().includes(needle)
            )
          );
        }

        this.filteredData = [...data];

        // ── Sort ──
        if (this._sort.active && this._sort.direction) {
          const dir = this._sort.direction === 'asc' ? 1 : -1;
          const key = this._sort.active as keyof T;
          data = data.slice().sort((a, b) => {
            const va = a[key];
            const vb = b[key];
            if (typeof va === 'number' && typeof vb === 'number') {
              return (va - vb) * dir;
            }
            return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
          });
        }

        // ── Paginate ──
        const start = this._paginator.pageIndex * this._paginator.pageSize;
        return data.slice(start, start + this._paginator.pageSize);
      })
    );
  }

  disconnect(): void {}
}
