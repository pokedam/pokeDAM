package org.cifpaviles.pokedam.rest_server.repository;

import org.cifpaviles.pokedam.rest_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByRefreshToken(String refreshToken);

    Optional<User> findByEmail(String email);

    @Modifying
    @Transactional
    @Query("""
                UPDATE User u SET
                    u.nickname = COALESCE(:nickname, u.nickname),
                    u.avatarId = COALESCE(:avatarId, u.avatarId),
                    u.email = COALESCE(:email, u.email),
                    u.password = COALESCE(:password, u.password)
                WHERE u.id = :id
            """)
    int patchUser(
            @Param("id") Long id,
            @Param("nickname") String nickname,
            @Param("avatarId") Long avatarId,
            @Param("email") String email,
            @Param("password") String password);
}
