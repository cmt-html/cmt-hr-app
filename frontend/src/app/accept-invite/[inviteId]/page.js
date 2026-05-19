"use client";

import AcceptInvite from '../../../pages/AcceptInvite';

export default function Page({ params }) {
  return <AcceptInvite inviteId={params.inviteId} />;
}
