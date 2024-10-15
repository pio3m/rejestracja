"use client"

import { useState } from "react"
import axios from "axios"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast, useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function Component() {
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | undefined>(undefined)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [joinWaitlist, setJoinWaitlist] = useState(false)
  const { toast } = useToast()

  const therapists = [
    { id: "1", name: "Tomasz Radkiewicz", specialization: "Psychoterapeuta, Trener rozwoju osobistego", image: "https://centrumobecnosci.pl/wp-content/uploads/2024/10/tomasz_radkiewicz_centrum_obecnosci.jpg", available: true },
   ]

  const consultations = [
    { id: "1", name: "Konsultacja indywidualna", price: "200 zł", duration: "50 min" },
    { id: "2", name: "Terapia par", price: "250 zł", duration: "80 min" },
    { id: "3", name: "Coaching", price: "300 zł", duration: "60 min" },
  ]

  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
  ]

  const isDateAvailable = (date: Date) => {
    const day = date.getDay()
    return day !== 0 && day !== 6
  }

  const handleTherapistSelection = (id: string) => {
    setSelectedTherapist(id)
    const therapist = therapists.find(t => t.id === id)
    if (therapist && !therapist.available) {
      setIsWaitlistOpen(true)
    } else {
      setIsWaitlistOpen(false)
    }
  }

  const handleBooking = async () => {
    if (isWaitlistOpen && joinWaitlist) {
      // Obsługa listy oczekujących (opcjonalnie)
      toast({
        title: "Dodano do listy oczekujących",
        description: `Zostaniesz powiadomiony, gdy ${therapists.find(t => t.id === selectedTherapist)?.name} będzie dostępny.`,
      });
    } else if (selectedTherapist && selectedConsultation && date && time) {
      // Walidacja danych
      if (!name || !email || !phone) {
        toast({
          title: "Błąd",
          description: "Proszę wypełnić wszystkie dane osobowe.",
          variant: "destructive",
        });
        return;
      }

      // Sprawdzenie poprawności adresu e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Błąd",
          description: "Proszę podać poprawny adres e-mail.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await axios.post('http://localhost:8000/book_appointment.php', {
          therapist: therapists.find(t => t.id === selectedTherapist)?.name,
          consultation: consultations.find(c => c.id === selectedConsultation)?.name,
          date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
          time: time, // Format HH:MM
          name,
          email,
          phone,
        });

        if (response.data.success) {
          toast({
            title: "Wizyta zarezerwowana!",
            description: `Twoja wizyta została zaplanowana na ${date.toLocaleDateString()} o ${time}.`,
          });
          // Możesz wyczyścić formularz lub przekierować użytkownika
        } else {
          toast({
            title: "Błąd",
            description: response.data.error || "Wystąpił błąd podczas rezerwacji.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Błąd",
          description: "Wystąpił błąd podczas połączenia z serwerem.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-[#f0f4f8] to-[#d9e2ec] rounded-lg shadow-xl">
      <div className="flex justify-center mb-8">
        <Image
          src="https://centrumobecnosci.pl/wp-content/uploads/2024/05/Centrum_Obecnosci_mini2_b-147x57.png"
          alt="Centrum Obecności Logo"
          width={147}
          height={57}
        />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8 text-[#334e68]">Zarezerwuj wizytę terapeutyczną</h1>
      
      {/* Lista terapeutów */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#334e68]">Wybierz terapeutę</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {therapists.map((therapist) => (
            <Card 
              key={therapist.id} 
              className={`cursor-pointer transition-all ${selectedTherapist === therapist.id ? 'ring-2 ring-[#627d98]' : 'hover:shadow-md'}`}
              onClick={() => handleTherapistSelection(therapist.id)}
            >
              <CardHeader className="p-4">
                <Image
                  src={therapist.image}
                  alt={`Zdjęcie ${therapist.name}`}
                  width={100}
                  height={100}
                  className="rounded-full mx-auto"
                />
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle className="text-lg mb-2 text-[#334e68]">{therapist.name}</CardTitle>
                <p className="text-sm text-[#486581]">{therapist.specialization}</p>
                {!therapist.available && (
                  <p className="text-sm text-[#ab091e] mt-2">Brak dostępnych terminów</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Rodzaje konsultacji */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#334e68]">Wybierz rodzaj konsultacji</h2>
        <RadioGroup onValueChange={setSelectedConsultation} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {consultations.map((consultation) => (
            <div key={consultation.id}>
              <RadioGroupItem
                value={consultation.id}
                id={`consultation-${consultation.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`consultation-${consultation.id}`}
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#bcccdc] bg-white p-4 hover:bg-[#f0f4f8] peer-data-[state=checked]:border-[#627d98] peer-data-[state=checked]:bg-[#e1e8ef] [&:has([data-state=checked])]:border-[#627d98]"
              >
                <span className="text-lg font-semibold mb-2 text-[#334e68]">{consultation.name}</span>
                <span className="text-sm text-[#627d98]">{consultation.duration}</span>
                <span className="text-lg font-bold text-[#334e68] mt-2">{consultation.price}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Kalendarz */}
      {!isWaitlistOpen && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#334e68]">Wybierz datę i godzinę</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={date => !isDateAvailable(date)}
              className="rounded-md border bg-white"
            />
            <div>
              <Select onValueChange={setTime}>
                <SelectTrigger className="w-full mb-4 bg-white border-[#bcccdc] text-[#334e68]">
                  <SelectValue placeholder="Wybierz godzinę" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      )}

      {/* Dane osobowe */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#334e68]">Twoje dane</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-[#486581]">Imię i nazwisko</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jan Kowalski" className="bg-white border-[#bcccdc] text-[#334e68]" />
          </div>
          <div>
            <Label htmlFor="email" className="text-[#486581]">Adres e-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan@example.com" className="bg-white border-[#bcccdc] text-[#334e68]" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-[#486581]">Numer telefonu</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="123 456 789" className="bg-white border-[#bcccdc] text-[#334e68]" />
          </div>
        </div>
      </section>

      {/* Lista oczekujących */}
      {isWaitlistOpen && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#334e68]">Lista oczekujących</h2>
          <div className="bg-white p-4 rounded-md border border-[#bcccdc]">
            <p className="mb-4 text-[#486581]">Wybrany terapeuta nie ma obecnie dostępnych terminów. Czy chcesz dołączyć do listy oczekujących?</p>
            <div className="flex items-center space-x-2">
              <Checkbox id="waitlist" checked={joinWaitlist} onCheckedChange={(checked) => setJoinWaitlist(checked as boolean)} />
              <label
                htmlFor="waitlist"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#486581]"
              >
                Tak, chcę dołączyć do listy oczekujących
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Przycisk rezerwacji/dołączenia do listy oczekujących */}
      <section className="text-center">
        <Button 
          onClick={handleBooking}
          className="bg-[#334e68] hover:bg-[#243b53] text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          disabled={!selectedTherapist || (!isWaitlistOpen && (!selectedConsultation || !date || !time))}
        >
          {isWaitlistOpen ? "Dołącz do listy oczekujących" : "Zarezerwuj wizytę"}
        </Button>
      </section>
    </div>
  )
}
