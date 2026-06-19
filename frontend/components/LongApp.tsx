"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PlaceModal } from "@/components/PlaceModal";
import { DiscoverView } from "@/components/views/DiscoverView";
import { HomeView } from "@/components/views/HomeView";
import { PlanView } from "@/components/views/PlanView";
import { RewardsView } from "@/components/views/RewardsView";
import { SavedView } from "@/components/views/SavedView";
import { useLongApp } from "@/lib/useLongApp";

export function LongApp() {
  const app = useLongApp();

  return (
    <>
      <AppShell coins={app.stats.total_coins} status={app.status} view={app.view} setView={app.setView}>
        {app.view === "home" && (
          <HomeView
            featured={app.featured}
            savedCount={app.saved.length}
            stats={app.stats}
            setView={app.setView}
            buildRoute={app.buildRoute}
          />
        )}

        {app.view === "discover" && (
          <DiscoverView
            cities={app.cities}
            selectedCities={app.selectedCities}
            activePlace={app.activePlace}
            activeIndex={app.activeIndex}
            total={app.deck.length}
            chooseCity={app.chooseCity}
            swipe={app.swipe}
            resetDiscovery={app.resetDiscovery}
            openPlace={app.setSelectedPlace}
          />
        )}

        {app.view === "saved" && (
          <SavedView
            saved={app.saved}
            openPlace={app.setSelectedPlace}
            removeSaved={app.removeSaved}
            setView={app.setView}
            buildRoute={app.buildRoute}
          />
        )}

        {app.view === "plan" && (
          <PlanView
            route={app.route}
            cities={app.cities}
            routeCity={app.routeCity}
            setRouteCity={app.setRouteCity}
            personality={app.personality}
            setPersonality={app.setPersonality}
            duration={app.duration}
            setDuration={app.setDuration}
            buildRoute={app.buildRoute}
            openPlace={app.setSelectedPlace}
          />
        )}

        {app.view === "rewards" && <RewardsView rewards={app.rewards} stats={app.stats} redeem={app.redeem} />}
      </AppShell>

      {app.selectedPlace && <PlaceModal place={app.selectedPlace} close={() => app.setSelectedPlace(null)} />}
    </>
  );
}
