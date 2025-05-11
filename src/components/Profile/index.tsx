import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
  profile?: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Eğer profil verisi yoksa veya rol yoksa, geçici olarak "Loading..." mesajını göster
  const roleToDisplay = profile?.role
    ? typeof profile?.role === "object"
      ? profile?.role?.name || "Role name unavailable"
      : profile?.role // Eğer rol bir stringse, doğrudan göster
    : "Loading..."; // Profil veya rol verisi gelmemişse "Loading..." göster

  return (
    <div className="profile-section">
      <div className="profile-info">
        <h2>
          Welcome, {profile?.name ?? AuthSession.getName() ?? "Loading..."}
        </h2>
        <p>{profile?.email ?? AuthSession.getEmail() ?? "Loading..."}</p>
        <p>{roleToDisplay}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
