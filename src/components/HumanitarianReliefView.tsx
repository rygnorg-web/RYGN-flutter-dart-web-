import React from 'react';
import { Building2, CheckCircle2, HeartHandshake, LifeBuoy, ShieldCheck, Users } from 'lucide-react';
import { useCms } from '../contexts/CmsContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { EditableMedia, EditableText } from './InlineEditable';

export const HumanitarianReliefView: React.FC = () => {
  const { user, authReady, isAdmin } = useFirebase();
  const { editMode, getEffectiveValue } = useCms();

  const canEdit = Boolean(authReady && isAdmin && user?.emailVerified && editMode);
  const useDraftPreview = canEdit;

  const pageTitle = getEffectiveValue('humanitarian_page_title', useDraftPreview);

  return (
    <div className="@container w-full bg-white text-slate-900">
      {/* Hero Section */}
      <section className="px-5 pt-6 pb-6 @[500px]:px-7 @[500px]:pt-7 border-b border-slate-200 bg-[#FAFAF8]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0D5B36] mb-2">
          Rohingya Young Generation Network · Core Program
        </p>

        <EditableText
          itemId="humanitarian_page_title"
          as="h1"
          className="text-[28px] @[500px]:text-[34px] font-black text-slate-950 leading-[1.12] tracking-tight [text-wrap:balance]"
        />

        <EditableText
          itemId="humanitarian_hero_subtitle"
          as="p"
          className="mt-3 text-sm @[500px]:text-[15px] text-[#3A3A3A] leading-[1.6] font-normal whitespace-pre-wrap"
        />

        {/* Featured Banner Card */}
        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="relative h-[220px] @[500px]:h-[260px] bg-slate-100 overflow-hidden">
            <EditableMedia
              itemId="humanitarian_hero_image"
              alt={pageTitle}
              wrapperClassName="w-full h-full"
              imgClassName="w-full h-full object-cover"
              fallbackNode={
                <div className="w-full h-full bg-gradient-to-br from-amber-900 to-slate-900 flex flex-col items-center justify-center px-6 text-center text-white">
                  <LifeBuoy className="w-10 h-10 text-[#FFD600] mb-2" />
                  <p className="text-sm font-bold">Humanitarian Assistance & Relief</p>
                </div>
              }
            />
          </div>

          <div className="p-4 @[500px]:p-6 border-t border-slate-100 space-y-4">
            <EditableText
              itemId="humanitarian_intro_text"
              as="p"
              className="text-[#3A3A3A] text-sm @[500px]:text-[16px] leading-[1.7] font-normal whitespace-pre-wrap"
            />
          </div>
        </div>
      </section>

      {/* Program Focus Areas */}
      <section className="px-5 py-6 @[500px]:px-7 border-b border-slate-200 space-y-5 bg-white">
        <h2 className="text-lg @[500px]:text-xl font-black text-slate-950 tracking-tight">
          Relief & Welfare Pillars
        </h2>

        <div className="grid grid-cols-1 @[500px]:grid-cols-3 gap-3">
          {[
            {
              titleId: 'humanitarian_feature_1_title',
              descId: 'humanitarian_feature_1_desc',
              icon: LifeBuoy,
            },
            {
              titleId: 'humanitarian_feature_2_title',
              descId: 'humanitarian_feature_2_desc',
              icon: ShieldCheck,
            },
            {
              titleId: 'humanitarian_feature_3_title',
              descId: 'humanitarian_feature_3_desc',
              icon: Users,
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleId}
                className="rounded-xl border border-slate-200 bg-[#FAFAF8] p-4 flex flex-col justify-between space-y-3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#0D5B36]" />
                </div>
                <div className="space-y-1.5">
                  <EditableText
                    itemId={item.titleId}
                    as="div"
                    className="text-sm font-extrabold text-slate-950 leading-snug"
                  />
                  <EditableText
                    itemId={item.descId}
                    as="p"
                    className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community Commitment */}
      <section className="px-5 py-6 @[500px]:px-7 bg-[#FAFAF8] space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0D5B36]" />
            <h3 className="text-base font-black text-slate-950">Compassionate Community Support</h3>
          </div>
          <EditableText
            itemId="humanitarian_impact_text"
            as="p"
            className="text-xs @[500px]:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
          />
        </div>
      </section>
    </div>
  );
};
