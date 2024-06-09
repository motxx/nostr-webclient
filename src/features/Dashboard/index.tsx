import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'immutability-helper'
import { DashboardCard } from './components/DashboardCard'
import { DashboardTotalEarnings } from './components/DashboardTotalEarnings'
import { DarshboardZapEarnings } from './components/DashboardZapEarnings'
import { DarshboardPaidContentSales } from './components/DashboardPaidContentSales'
import { DashboardNotesEngagement } from './components/DashboardNotesEngagement'
import { DarshboardUserDemographics } from './components/DashboardUserDemographics'
import './style.css'

interface Card {
  id: number
  content: React.ReactNode
}

const DashboardPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([
    { id: 2, content: <DashboardTotalEarnings /> },
    { id: 3, content: <DarshboardZapEarnings /> },
    { id: 4, content: <DarshboardPaidContentSales /> },
    { id: 5, content: <DashboardNotesEngagement /> },
    { id: 6, content: <DarshboardUserDemographics /> },
  ])

  const moveCard = (id: number, atIndex: number) => {
    const { card, index } = findCard(id)
    setCards(
      update(cards, {
        $splice: [
          [index, 1],
          [atIndex, 0, card],
        ],
      })
    )
  }

  const findCard = (id: number) => {
    const card = cards.filter((c) => c.id === id)[0]
    return {
      card,
      index: cards.indexOf(card),
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="py-6 sm:px-4 bg-white dark:bg-black min-h-screen">
        <h2 className="text-2xl px-2 font-bold mb-4 text-gray-700 dark:text-gray-300">
          アナリティクス
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-[80px]">
          {cards.map((card) => (
            <DashboardCard
              key={card.id}
              id={card.id}
              moveCard={moveCard}
              findCard={findCard}
            >
              {card.content}
            </DashboardCard>
          ))}
        </div>
      </div>
    </DndProvider>
  )
}

export default DashboardPage
