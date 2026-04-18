import MainMap from '../map'
import TimelineFeed from '../timeLine'
import StatsCard from '../stats'
import Filters from 'src/components/filters'

export default function Home() {
  return (
    <section className="w-full h-fit flex flex-col items-center gap-5  py-5">
      <div>
        <Filters />
      </div>

      <MainMap />

      <div className="flex justify-between w-[95%]">
        <TimelineFeed />
        <StatsCard />
      </div>
    </section>
  )
}
