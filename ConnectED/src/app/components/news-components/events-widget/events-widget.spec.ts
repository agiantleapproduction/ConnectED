import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsWidget } from './events-widget';

describe('EventsWidget', () => {
  let component: EventsWidget;
  let fixture: ComponentFixture<EventsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
