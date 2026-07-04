import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';

import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

@NgModule({
  declarations: [NotFoundComponent, UnauthorizedComponent],
  imports: [SharedModule, PagesRoutingModule],
})
export class PagesModule {}
