import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, Booking } from '../../types';
import { SportFilterBar } from './SportFilterBar';
import { TimeGridSchedule } from './TimeGridSchedule';
import { BookingModal } from './BookingModal';
import { Info, Calendar, Phone, Sparkles } from 'lucide-react';

export const AllCourtsScheduleView: React.FC = () => {
  const { courts, settings } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<{ court: Court; startTime: string; endTime: string } | null>(null);

  return (
    <div className="space-y-6">
      {/* Sport Selector & Date Picker */}
      <SportFilterBar />

      {/* Time-Grid Matrix */}
      <TimeGridSchedule
        onSelectSlot={(court, startTime, endTime) => {
          setSelectedSlot({ court, startTime, endTime });
        }}
        onViewBookingDetails={(booking) => {
          alert(`Khung giờ này đã được đặt trước bởi khách hàng khác. Vui lòng chọn các ô màu xanh còn trống hoặc liên hệ Hotline ${settings.hotline} để được tư vấn.`);
        }}
      />

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          court={selectedSlot.court}
          initialStartTime={selectedSlot.startTime}
          initialEndTime={selectedSlot.endTime}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};
