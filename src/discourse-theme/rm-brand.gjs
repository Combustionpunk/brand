// RC Misfits theme: the shared top bar and the brand theme that matches the member's
// colour scheme. Generated from Combustionpunk/brand (src/discourse-theme/): do not edit here.
import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { getOwner } from "@ember/owner";
import { service } from "@ember/service";
import { apiInitializer } from "discourse/lib/api";
import { watchForumTheme } from "../lib/rm-brand";

class RmForumHeader extends Component {
  @service currentUser;

  get username() {
    return this.currentUser?.username ?? "";
  }

  get tracksUrl() {
    return settings.tracks_url || null;
  }

  get timingUrl() {
    return settings.timing_url || null;
  }

  // Discourse's own sign-in: the login modal, or SSO if the forum uses it.
  @action
  signIn(event) {
    event.preventDefault();
    getOwner(this).lookup("route:application").send("showLogin");
  }

  // Discourse's own sign-out: a DELETE of the session, then its redirect. Never a GET link.
  @action
  signOut(event) {
    event.preventDefault();
    getOwner(this).lookup("route:application").send("logout");
  }

  <template>
    <rm-header
      site="forum"
      user={{this.username}}
      forum-url="/"
      meetings-url="/events"
      tracks-url={{this.tracksUrl}}
      timing-url={{this.timingUrl}}
      {{on "rm-sign-in" this.signIn}}
      {{on "rm-sign-out" this.signOut}}
    ></rm-header>
  </template>
}

export default apiInitializer((api) => {
  watchForumTheme(document);
  api.renderInOutlet("above-site-header", RmForumHeader);
});
