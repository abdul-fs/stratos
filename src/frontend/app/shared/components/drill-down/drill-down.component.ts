import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActionState } from '../../../store/reducers/api-request-reducer/types';
import { map, distinctUntilChanged, tap, startWith, debounceTime, delay } from 'rxjs/operators';
export interface IDrillDownLevelRequest {
  data$: Observable<any[]>;
  state$?: Observable<ActionState>;
}
export interface DrillDownLevel {
  title: string;
  request: ((parent?: any, allAncestors?: any[]) => IDrillDownLevelRequest) | IDrillDownLevelRequest,
  selectItem?: (parent?: any, allAncestors?: any[]) => void;
}

export type DrillDownDefinition = DrillDownLevel[];

@Component({
  selector: 'app-drill-down',
  templateUrl: './drill-down.component.html',
  styleUrls: ['./drill-down.component.scss']
})
export class DrillDownComponent implements OnInit {
  @Input('definition')
  private definition: DrillDownDefinition;

  public levelData: {
    title: string,
    selected: {
      index: number,
      item: any
    },
    data$: Observable<any[]>;
    // state$: Observable<ActionState>;
    isBusy$: Observable<boolean>;
  }[] = [];

  public clickItem(item, itemIndex: number, levelIndex: number, $event: MouseEvent) {
    const nextIndex = levelIndex + 1;
    if (this.definition[nextIndex]) {
      this.addLevel(nextIndex, item);
      this.setSelectedForLevel(itemIndex, levelIndex, item);
    }
  }

  public setSelectedForLevel(index: number, levelIndex: number, item: any) {
    this.levelData[levelIndex].selected = { index, item };
  }

  private getLevelRequest(level: DrillDownLevel, item?: any, allSelected?: any[]) {
    const request = level.request;
    if (typeof request === 'function') {
      return request(item, allSelected);
    }
    return request;
  }

  public addLevel(levelIndex: number, item?: any) {
    const levelData = this.definition[levelIndex];
    if (levelData) {
      const allSelected = this.levelData.map((level, i) => level.selected.item);
      if (levelData.selectItem) {
        levelData.selectItem(item, allSelected);
      }

      const { data$, state$ = of({ busy: false, error: false, message: '' }) } = this.getLevelRequest(levelData, item, allSelected);
      const isBusy$ = state$.pipe(
        map(state => state.busy),
        delay(0),
        distinctUntilChanged(),
        tap(console.log)
      );
      if (this.levelData.length > (levelIndex + 1)) {
        // Remove old data
        this.levelData = this.levelData.slice(0, levelIndex);
      }
      this.levelData[levelIndex] = { title: levelData.title, data$, selected: { index: null, item: null }, isBusy$ };
    }
  }

  ngOnInit() {
    this.addLevel(0);
  }

}
